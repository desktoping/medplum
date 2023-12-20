import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { MedplumClient, PatchOperation } from '@medplum/core';
import { Task } from '@medplum/fhirtypes';
import { IconCircleCheck, IconCircleOff } from '@tabler/icons-react';

interface PauseResumeTaskProps {
  task: Task;
  onChange: (updatedTask: Task) => void;
  medplum: MedplumClient;
}

export function PauseResumeTask({ task, onChange, medplum }: PauseResumeTaskProps): JSX.Element {
  const handleChangeTaskStatus = async (): Promise<void> => {
    if (!task?.id) {
      return;
    }

    const ops: PatchOperation[] = [{ op: 'test', path: '/meta/versionId', value: task.meta?.versionId }];

    // If the task is paused, resume it, otherwise pause it
    if (task.status !== 'on-hold') {
      ops.push({ op: 'replace', path: '/status', value: 'on-hold' });
    } else {
      ops.push({ op: 'replace', path: '/status', value: 'in-progress' });
    }

    // Patch the task with the updated status
    try {
      const result = await medplum.patchResource('Task', task.id, ops);
      notifications.show({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: ops[1].value === 'on-hold' ? 'Task paused' : 'Task resumed',
      });
      onChange(result);
    } catch (error) {
      notifications.show({
        color: 'red',
        icon: <IconCircleOff />,
        title: 'Error',
        message: 'Another user modified this task.',
      });
    }
  };

  return (
    <div>
      {task.status === 'on-hold' ? (
        <Button fullWidth onClick={handleChangeTaskStatus}>
          Resume Task
        </Button>
      ) : (
        <Button fullWidth onClick={handleChangeTaskStatus}>
          Pause Task
        </Button>
      )}
    </div>
  );
}

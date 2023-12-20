import { Button, Group, Modal, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createReference, MedplumClient, normalizeErrorString, PatchOperation } from '@medplum/core';
import { Practitioner, Task } from '@medplum/fhirtypes';
import { IconCircleCheck, IconCircleOff } from '@tabler/icons-react';
import { useState } from 'react';

interface ClaimTaskProps {
  task: Task;
  onChange: (updatedTask: Task) => void;
  medplum: MedplumClient;
}

export function ClaimTask(props: ClaimTaskProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpenClose = (): void => {
    setIsOpen(!isOpen);
  };

  const handleClaimTask = async (task: Task, medplum: MedplumClient, onChange: (task: Task) => void): Promise<void> => {
    // Get the current user and create a reference to their profile resource
    const currentUser = medplum.getProfile() as Practitioner;

    if (!task?.id) {
      return;
    }

    // Create a patch operation to update the owner to the current user. For more details on task assignment, see https://www.medplum.com/docs/careplans/tasks#task-assignment
    const ops: PatchOperation[] = [
      { op: 'test', path: '/meta/versionId', value: task.meta?.versionId },
      { op: 'add', path: '/owner', value: createReference(currentUser) },
    ];

    console.log(ops);

    // Patch the task with the current user as the new owner
    try {
      const result = await medplum.patchResource('Task', task.id, ops);
      notifications.show({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: 'Task claimed',
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

    setIsOpen(false);
  };

  return (
    <div>
      <Button fullWidth onClick={handleOpenClose}>
        Claim Task
      </Button>
      <Modal opened={isOpen} onClose={handleOpenClose}>
        <Text fw={700}>Are you sure you want to assign this task to yourself?</Text>
        <Group>
          <Button onClick={() => handleClaimTask(props.task, props.medplum, props.onChange)}>Claim</Button>
          <Button variant="outline">Cancel</Button>
        </Group>
      </Modal>
    </div>
  );
}

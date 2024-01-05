import { Button, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getQuestionnaireAnswers, MedplumClient, PatchOperation } from '@medplum/core';
import { Questionnaire, QuestionnaireResponse, Reference, Task } from '@medplum/fhirtypes';
import { QuestionnaireForm, useMedplum } from '@medplum/react';
import { IconCircleCheck, IconCircleOff } from '@tabler/icons-react';
import { useState } from 'react';

interface AssignTaskProps {
  task: Task;
  onChange: (updatedTask: Task) => void;
}

export function AssignRole(props: AssignTaskProps): JSX.Element {
  const medplum = useMedplum();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenClose = (): void => {
    setIsModalOpen(!isModalOpen);
  };

  const handleAssignToRole = async (
    role: Reference,
    task: Task,
    medplum: MedplumClient,
    onChange: (task: Task) => void
  ): Promise<void> => {
    if (!task?.id) {
      return;
    }

    const ops: PatchOperation[] = [{ op: 'test', path: '/meta/versionId', value: task.meta?.versionId }];
    const op: PatchOperation['op'] = task.performerType ? 'replace' : 'add';

    ops.push({ op, path: '/performerType', value: role });

    try {
      const result = await medplum.patchResource('Task', task.id, ops);
      notifications.show({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: 'Task assigned',
      });
      onChange(result);
    } catch {
      notifications.show({
        color: 'red',
        icon: <IconCircleOff />,
        title: 'Error',
        message: 'Another user modified the task.',
      });
    }
  };

  const onQuestionnaireSubmit = (formData: QuestionnaireResponse): void => {
    const role = getQuestionnaireAnswers(formData)['assign-role'].valueReference;

    if (role) {
      handleAssignToRole(role, props.task, medplum, props.onChange).catch((error) => console.error(error));
    }

    setIsModalOpen(false);
  };

  return (
    <div>
      <Button fullWidth onClick={handleOpenClose}>
        Assign to a Role
      </Button>
      <Modal opened={isModalOpen} onClose={handleOpenClose}>
        <QuestionnaireForm questionnaire={assignRoleQuestionnaire} onSubmit={onQuestionnaireSubmit} />
      </Modal>
    </div>
  );
}

const assignRoleQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'assign-role',
  title: 'Assign to a Role',
  item: [
    {
      linkId: 'assign-role',
      text: 'Select Role',
      type: 'choice',
      answerValueSet: 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1099.30',
    },
  ],
};

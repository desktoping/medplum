import { Button, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getQuestionnaireAnswers, MedplumClient, normalizeErrorString, PatchOperation } from '@medplum/core';
import { CodeableConcept, Coding, Questionnaire, QuestionnaireResponse, Task } from '@medplum/fhirtypes';
import { QuestionnaireForm, useMedplum } from '@medplum/react';
import { IconCircleCheck, IconCircleOff } from '@tabler/icons-react';
import { useState } from 'react';

interface UpdateBusinessStatusProps {
  task: Task;
  onChange: (updatedTask: Task) => void;
  medplum: MedplumClient;
}

export function UpdateBusinessStatus(props: UpdateBusinessStatusProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpenClose = () => {
    setIsOpen(!isOpen);
  };

  const handleUpdateStatus = async (
    status: Coding,
    task: Task,
    medplum: MedplumClient,
    onChange: (task: Task) => void
  ): Promise<void> => {
    if (!task?.id) {
      return;
    }

    // Create a businessStatus to add to the task. For more details, see https://www.medplum.com/docs/careplans/tasks#task-status
    const businessStatus: CodeableConcept = { coding: [status] };
    console.log(businessStatus);

    const ops: PatchOperation[] = [{ op: 'test', path: '/meta/versionId', value: task.meta?.versionId }];

    if (task.businessStatus) {
      ops.push({ op: 'replace', path: '/businessStatus', value: businessStatus });
    } else {
      ops.push({ op: 'add', path: '/businessStatus', value: businessStatus });
    }

    // Patch the task with the new businessStatus
    try {
      const result = await medplum.patchResource('Task', task.id, ops);
      notifications.show({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: 'Status updated.',
      });
      onChange(result);
    } catch (error) {
      notifications.show({
        color: 'red',
        icon: <IconCircleOff />,
        title: 'Error',
        message: normalizeErrorString(error),
      });
    }
  };

  const onQuestionnaireSubmit = (formData: QuestionnaireResponse): void => {
    const status = getQuestionnaireAnswers(formData)['update-status'].valueCoding;

    if (status) {
      handleUpdateStatus(status, props.task, props.medplum, props.onChange);
    }

    setIsOpen(false);
  };

  return (
    <div>
      <Button fullWidth onClick={handleOpenClose}>
        Update Business Status
      </Button>
      <Modal opened={isOpen} onClose={handleOpenClose}>
        <QuestionnaireForm questionnaire={updateStatusQuestionnaire} onSubmit={onQuestionnaireSubmit} />
      </Modal>
    </div>
  );
}

const updateStatusQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'update-status',
  title: 'Update the Status of the Task',
  item: [
    {
      linkId: 'update-status',
      text: 'Update Status',
      type: 'choice',
      answerValueSet: 'https://example-business.org',
    },
  ],
};

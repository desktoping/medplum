import { Button, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getQuestionnaireAnswers, MedplumClient, normalizeErrorString, PatchOperation } from '@medplum/core';
import { Period, Questionnaire, QuestionnaireResponse, Task, TaskRestriction } from '@medplum/fhirtypes';
import { QuestionnaireForm, useMedplum } from '@medplum/react';
import { IconCircleCheck, IconCircleOff } from '@tabler/icons-react';
import { useState } from 'react';

interface AddDueDateProps {
  task: Task;
  onChange: (updatedTask: Task) => void;
  medplum: MedplumClient;
}

export function AddDueDate(props: AddDueDateProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpenClose = (): void => {
    setIsOpen(!isOpen);
  };

  const handleAddDueDate = async (
    date: string,
    task: Task,
    medplum: MedplumClient,
    onChange: (task: Task) => void
  ): Promise<void> => {
    const ops: PatchOperation[] = [{ op: 'test', path: '/meta/versionId', value: task.meta?.versionId }];

    // Create a restriction period with the due-date if one doesn't already exist and add it to the PatchOperation. For more details on task due-dates, see https://www.medplum.com/docs/careplans/tasks#task-start--due-dates
    if (!task.restriction) {
      const restriction: TaskRestriction = {
        period: {
          end: date,
        },
      };
      ops.push({ op: 'add', path: '/restriction', value: restriction });
    } else {
      const period: Period = {
        ...task.restriction.period,
        end: date,
      };
      const restriction: TaskRestriction = {
        ...task.restriction,
        period,
      };
      ops.push({ op: 'replace', path: '/restriction', value: restriction });
    }

    if (!task.id) {
      return;
    }

    // Patch the resource with the new due-date
    try {
      const result = await medplum.patchResource('Task', task.id, ops);
      notifications.show({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: 'Due-date updated.',
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
    const dueDate = getQuestionnaireAnswers(formData)['due-date'].valueDate;

    if (dueDate) {
      handleAddDueDate(dueDate, props.task, props.medplum, props.onChange);
    }

    setIsOpen(false);
  };

  return (
    <div>
      {props.task.restriction?.period?.end ? (
        <Button fullWidth onClick={handleOpenClose}>
          Change Due-Date
        </Button>
      ) : (
        <Button fullWidth onClick={handleOpenClose}>
          Add Due-Date
        </Button>
      )}
      <Modal opened={isOpen} onClose={handleOpenClose}>
        <QuestionnaireForm questionnaire={dueDateQuestionnaire} onSubmit={onQuestionnaireSubmit} />
      </Modal>
    </div>
  );
}

const dueDateQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'due-date',
  title: 'Due-Date',
  item: [
    {
      linkId: 'due-date',
      text: 'The date the task should be completed',
      type: 'date',
    },
  ],
};

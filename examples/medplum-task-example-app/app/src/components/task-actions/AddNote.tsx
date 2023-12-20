import { Button, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  createReference,
  getQuestionnaireAnswers,
  MedplumClient,
  normalizeErrorString,
  PatchOperation,
} from '@medplum/core';
import { Annotation, Questionnaire, QuestionnaireResponse, Task } from '@medplum/fhirtypes';
import { QuestionnaireForm, useMedplum } from '@medplum/react';
import { IconCircleCheck, IconCircleOff } from '@tabler/icons-react';
import { useState } from 'react';

interface AddCommentProps {
  task: Task;
  onChange: (updatedTask: Task) => void;
  medplum: MedplumClient;
}

export function AddNote(props: AddCommentProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const author = props.medplum.getProfile();

  const handleOpenClose = (): void => {
    setIsOpen(!isOpen);
  };

  const handleAddComment = async (
    comment: Annotation,
    task: Task,
    medplum: MedplumClient,
    onChange: (task: Task) => void
  ) => {
    const ops: PatchOperation[] = [{ op: 'test', path: '/meta/versionId', value: task.meta?.versionId }];

    // Get the task notes if they exist and add the new note to the list. See https://www.medplum.com/docs/careplans/tasks#task-comments
    let taskNotes = task?.note;
    if (taskNotes) {
      // If there are already notes, push on to the array
      taskNotes.push(comment);
      ops.push({ op: 'replace', path: '/note', value: taskNotes });
    } else {
      // Otherwise, create an array with the first comment
      taskNotes = [comment];
      ops.push({ op: 'add', path: '/note', value: taskNotes });
    }

    if (!task?.id) {
      return;
    }

    // Update the resource on the server using a patch request. See https://www.medplum.com/docs/sdk/core.medplumclient.patchresource
    try {
      const result = await medplum.patchResource('Task', task.id, ops);
      notifications.show({
        icon: <IconCircleCheck />,
        title: 'Success',
        message: 'Comment added.',
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
    const answer = getQuestionnaireAnswers(formData)['new-comment'].valueString;

    // Create a new note
    if (answer) {
      const newNote: Annotation = {
        text: answer,
        authorReference: author && createReference(author),
        time: new Date().toISOString(),
      };

      // Add the note to the task
      handleAddComment(newNote, props.task, props.medplum, props.onChange);
    }

    // Close the modal
    setIsOpen(false);
  };

  return (
    <div>
      <Button fullWidth onClick={handleOpenClose}>
        Add a Note
      </Button>
      <Modal opened={isOpen} onClose={handleOpenClose}>
        <QuestionnaireForm questionnaire={commentQuestionnaire} onSubmit={onQuestionnaireSubmit} />
      </Modal>
    </div>
  );
}

const commentQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'add-comment',
  title: 'Add a comment',
  item: [
    {
      linkId: 'new-comment',
      text: 'Add a comment',
      type: 'string',
    },
  ],
};

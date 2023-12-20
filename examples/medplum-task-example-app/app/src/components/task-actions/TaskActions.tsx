import { Stack, Title } from '@mantine/core';
import { Task } from '@medplum/fhirtypes';
import { Loading, useMedplum, useResource } from '@medplum/react';
import { AddNote } from './AddNote';
import { AddDueDate } from './AddDueDate';
import { UpdateBusinessStatus } from './UpdateBusinessStatus';
import { AssignTask } from './AssignTask';
import { AssignRole } from './AssignRole';
import { ClaimTask } from './ClaimTask';
import { DeleteTask } from './DeleteTask';
import { PauseResumeTask } from './PauseResumeTask';
import { CompleteTask } from './CompleteTask';

interface TaskActionsProps {
  task: Task;
  onChange: (updatedTask: Task) => void;
}

export function TaskActions(props: TaskActionsProps): JSX.Element {
  const medplum = useMedplum();
  const task = useResource(props.task);

  if (!task) {
    return <Loading />;
  }

  return (
    <Stack>
      <Title>Task Actions</Title>
      <Stack>
        <AddNote task={task} onChange={props.onChange} medplum={medplum} />
        <AddDueDate task={task} onChange={props.onChange} medplum={medplum} />
        <UpdateBusinessStatus task={task} onChange={props.onChange} medplum={medplum} />
        <AssignTask task={task} onChange={props.onChange} medplum={medplum} />
        <AssignRole task={task} onChange={props.onChange} medplum={medplum} />
        {!task.owner ? <ClaimTask task={task} onChange={props.onChange} medplum={medplum} /> : null}
        <PauseResumeTask task={task} onChange={props.onChange} medplum={medplum} />
        <CompleteTask task={task} onChange={props.onChange} medplum={medplum} />
        <DeleteTask task={task} onChange={props.onChange} />
      </Stack>
    </Stack>
  );
}

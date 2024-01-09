import { Grid, Paper, Tabs, Title } from '@mantine/core';
import { getDisplayString, resolveId } from '@medplum/core';
import { Patient, Task } from '@medplum/fhirtypes';
import { DefaultResourceTimeline, Document, ResourceTable, useMedplum, useResource } from '@medplum/react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientChart } from '../components/patient-chart/PatientChart';
import { TaskActions } from '../components/actions/TaskActions';
import { NotesPage } from './NotesPage';

export function TaskPage(): JSX.Element {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const task = useResource<Task>({
    reference: `Task/${id}`,
  });
  // const [task, setTask] = useState<Task | undefined>(undefined);
  const tabs = ['Details', 'Timeline', 'Notes'];
  const [patient, setPatient] = useState<Patient | undefined>();

  // Set the current tab to what is in the URL, otherwise default to 'Details'
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const tab = window.location.pathname.split('/').pop();
    return tab && tabs.map((t) => t.toLowerCase()).includes(tab) ? tab : tabs[0].toLowerCase();
  });

  // useEffect(() => {
  //   // Fetch the task that is specified in the URL
  //   const fetchTask = async (): Promise<void> => {
  //     console.log('fetching task')
  //     try {
  //       const taskData = await medplum.readResource('Task', id);
  //       setTask(taskData);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   // Fetch the patient that this task if for. See https://www.medplum.com/docs/careplans/tasks#task-assignment for more details

  //   fetchTask().catch((error) => console.error(error));
  // }, [medplum, id]);

  useEffect(() => {
    const fetchLinkedPatient = async (): Promise<void> => {
      if (task?.for) {
        const patientId = resolveId(task.for);
        try {
          const patientData = patientId ? await medplum.readResource('Patient', patientId) : undefined;
          setPatient(patientData);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchLinkedPatient().catch((err) => console.error(err));
  }, [medplum, task]);

  // Update the current tab and navigate to its URL
  const handleTabChange = (newTab: string): void => {
    setCurrentTab(newTab);
    navigate(`/Task/${id}/${newTab}`);
  };

  // const onTaskChange = (updatedTask: Task): void => {
  //   setTask(updatedTask);
  // };

  if (!task) {
    return <Document>No Task found</Document>;
  }

  return (
    <Grid gutter="xs">
      <Grid.Col span={4}>
        <PatientProfile patient={patient} />
      </Grid.Col>
      <Grid.Col span={5}>
        <TaskDetails task={task} tabs={tabs} currentTab={currentTab} handleTabChange={handleTabChange} />
      </Grid.Col>
      <Grid.Col span={3}>{/* <Actions task={task} onTaskChange={onTaskChange} /> */}</Grid.Col>
    </Grid>
  );
}

interface PatientProfileProps {
  patient?: Patient;
}

function PatientProfile({ patient }: PatientProfileProps): JSX.Element {
  return (
    <Paper>{patient ? <PatientChart patient={patient} /> : <Document>No patient linked to this task</Document>}</Paper>
  );
}

interface TaskDetailsProps {
  task: Task;
  tabs: string[];
  currentTab: string;
  handleTabChange: (newTab: string) => void;
}

function TaskDetails({ task, tabs, currentTab, handleTabChange }: TaskDetailsProps): JSX.Element {
  return (
    <Paper p="md" key={task ? task.id : 'loading'}>
      <Title>{task.code?.coding?.[0].display ? task.code?.coding[0].display : getDisplayString(task)}</Title>
      <Tabs value={currentTab.toLowerCase()} onTabChange={handleTabChange}>
        <Tabs.List style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab} value={tab.toLowerCase()}>
              {tab}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <Tabs.Panel value="details">
          <ResourceTable key={`Task/${task.id}`} value={task} ignoreMissingValues={true} />
        </Tabs.Panel>
        <Tabs.Panel value="timeline">
          <DefaultResourceTimeline resource={task} />
        </Tabs.Panel>
        <Tabs.Panel value="notes">
          <NotesPage task={task} />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}

interface ActionsProps {
  task: Task;
  onTaskChange: (updatedTask: Task) => void;
}

function Actions({ task, onTaskChange }: ActionsProps): JSX.Element {
  return (
    <Paper p="md">
      <TaskActions task={task} onChange={onTaskChange} />
    </Paper>
  );
}

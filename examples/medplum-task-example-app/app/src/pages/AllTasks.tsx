import { Tabs } from '@mantine/core';
import { getReferenceString, Operator, SearchRequest } from '@medplum/core';
import { Document, SearchControl } from '@medplum/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateTaskModal } from '../components/task-actions/CreateTaskModal';

export function AllTasks(): JSX.Element {
  const navigate = useNavigate();
  const searchQuery = window.location.search;
  const tabs = ['Active', 'Completed'];
  const [currentTab, setCurrentTab] = useState(() => {
    const searchQuery = window.location.search;
    return handleInitialTab(searchQuery);
  });
  const [isNewOpen, setIsNewOpen] = useState<boolean>(false);

  const search: SearchRequest = {
    resourceType: 'Task',
    fields: ['code', 'priority', 'description', 'owner', 'for'],
    sortRules: [{ code: '-priority-order,due-date' }],
    filters:
      currentTab === 'active'
        ? [{ code: 'status:not', operator: Operator.EQUALS, value: 'completed' }]
        : [{ code: 'status', operator: Operator.EQUALS, value: 'completed' }],
  };

  useEffect(() => {
    if (!searchQuery) {
      navigate('/Task?status:not=completed');
    }
  }, []);

  const handleTabChange = (newTab: string): void => {
    setCurrentTab(newTab);
    if (newTab === 'completed') {
      navigate('/Task?status=completed');
    } else {
      navigate('/Task?status:not=completed');
    }
  };

  return (
    <Document>
      <Tabs value={currentTab.toLowerCase()} onTabChange={handleTabChange}>
        <Tabs.List style={{ whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab} value={tab.toLowerCase()}>
              {tab}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <Tabs.Panel value="active">
          <SearchControl
            search={search}
            onClick={(e) => navigate(`/${getReferenceString(e.resource)}`)}
            hideFilters={true}
            onNew={() => setIsNewOpen(!isNewOpen)}
          />
        </Tabs.Panel>
        <Tabs.Panel value="completed">
          <SearchControl
            search={search}
            onClick={(e) => navigate(`/${getReferenceString(e.resource)}`)}
            hideFilters={true}
            onNew={() => setIsNewOpen(!isNewOpen)}
          />
        </Tabs.Panel>
      </Tabs>
      <CreateTaskModal opened={isNewOpen} onClose={() => setIsNewOpen(!isNewOpen)} />
    </Document>
  );
}

function handleInitialTab(searchQuery: string): string {
  if (searchQuery === '?status=completed') {
    return 'completed';
  } else {
    return 'active';
  }
}

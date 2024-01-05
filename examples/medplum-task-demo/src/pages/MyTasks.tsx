import { Tabs } from '@mantine/core';
import { getReferenceString, Operator, SearchRequest } from '@medplum/core';
import { Resource } from '@medplum/fhirtypes';
import { Document, SearchControl, useMedplumProfile } from '@medplum/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function MyTasks(): JSX.Element {
  const profile = useMedplumProfile() as Resource;
  const navigate = useNavigate();
  const searchQuery = window.location.search;
  const tabs = ['Active', 'Completed'];
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const searchQuery = window.location.search;
    return handleInitialTab(searchQuery);
  });

  const filters =
    currentTab === 'active'
      ? [{ code: 'status:not', operator: Operator.EQUALS, value: 'completed' }]
      : [{ code: 'status', operator: Operator.EQUALS, value: 'completed' }];

  filters.push({ code: 'owner', operator: Operator.EQUALS, value: `${getReferenceString(profile)}` });

  const search: SearchRequest = {
    resourceType: 'Task',
    fields: ['code', '_lastUpdated', 'owner', 'for', 'priority'],
    sortRules: [{ code: '-priority-order,due-date' }],
    filters,
  };

  useEffect(() => {
    if (!searchQuery) {
      navigate('/Task/mytasks?status:not=completed');
    }
  });

  const handleTabChange = (newTab: string): void => {
    setCurrentTab(newTab);

    if (newTab === 'completed') {
      navigate('/Task/mytasks?status=completed');
    } else {
      navigate('/Task/mytasks?status:not=completed');
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
            hideToolbar={true}
            hideFilters={true}
          />
        </Tabs.Panel>
        <Tabs.Panel value="completed">
          <SearchControl
            search={search}
            onClick={(e) => navigate(`/${getReferenceString(e.resource)}`)}
            hideToolbar={true}
            hideFilters={true}
          />
        </Tabs.Panel>
      </Tabs>
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

import { formatSearchQuery, getReferenceString, parseSearchDefinition, SearchRequest, SortRule } from '@medplum/core';
import { Document, Loading, SearchControl, useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreateTaskModal } from '../components/actions/CreateTaskModal';

export function SearchPage(): JSX.Element {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState<SearchRequest>();
  const [isNewOpen, setIsNewOpen] = useState<boolean>(false);

  useEffect(() => {
    // Parse the search definition from the url and get the correct fields for the resource type
    const parsedSearch = parseSearchDefinition(location.pathname + location.search);
    if (!parsedSearch.resourceType) {
      navigate('/Task');
      return;
    }

    const populatedSearch = getPopulatedSearch(parsedSearch);

    if (
      location.pathname === `/${populatedSearch.resourceType}` &&
      location.search === formatSearchQuery(populatedSearch)
    ) {
      // If the url matches the parsed search and fields, execute the search
      setSearch(populatedSearch);
    } else {
      // If it doesn't, navigate to the correct URL
      navigate(`/${populatedSearch.resourceType}${formatSearchQuery(populatedSearch)}`);
    }
  }, [medplum, navigate, location]);

  if (!search?.resourceType || !search.fields || search.fields.length === 0) {
    return <Loading />;
  }

  return (
    <Document>
      <SearchControl
        search={search}
        onClick={(e) => navigate(`/${getReferenceString(e.resource)}`)}
        hideToolbar={true}
        hideFilters={true}
      />
      <CreateTaskModal opened={isNewOpen} onClose={() => setIsNewOpen(!isNewOpen)} />
    </Document>
  );
}

// Get the default fields for a given resource type
function getDefaultFields(resourceType: string): string[] {
  const fields = [];

  switch (resourceType) {
    case 'Patient':
      fields.push('name', 'birthdate', 'gender');
      break;
    case 'Practitioner':
      fields.push('name');
      break;
    case 'DiagnosticReport':
      fields.push('subject', 'code', 'status');
      break;
    case 'Communication':
      fields.push('sender', 'recipient', 'payload');
      break;
    case 'Task':
      fields.push('code', '_lastUpdated', 'owner', 'for', 'priority');
  }

  return fields;
}

function getSortRules(resourceType: string): SortRule[] {
  const sortRules = [];

  if (resourceType === 'Task') {
    sortRules.push({code: '-priority-order,due-date'});
  } else {
    sortRules.push({code: '-_lastUpdated'})
  }

  return sortRules;
}

function getPopulatedSearch(parsedSearch: SearchRequest): SearchRequest {
  const fields = parsedSearch.fields ?? getDefaultFields(parsedSearch.resourceType);
  const sortRules = parsedSearch.sortRules ?? getSortRules(parsedSearch.resourceType)

  const populatedSearch: SearchRequest = {
    ...parsedSearch,
    fields,
    sortRules,
  };

  return populatedSearch;
}

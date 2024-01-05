import { Filter, getReferenceString, Operator, SearchRequest } from '@medplum/core';
import { PractitionerRole } from '@medplum/fhirtypes';
import { Document, SearchControl, useMedplum } from '@medplum/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function RoleQueue(): JSX.Element {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const { roleDisplay } = useParams();
  const [role, setRole] = useState<PractitionerRole>();

  useEffect(() => {
    console.log(roleDisplay);
    const getRole = async (): Promise<void> => {
      const roleBySpecialty = await medplum.searchOne('PractitionerRole', {
        specialty: roleDisplay,
      });

      if (roleBySpecialty) {
        setRole(roleBySpecialty);
        return;
      }

      const roleByCode = await medplum.searchOne('PractitionerRole', {
        role: roleDisplay,
      });

      if (roleByCode) {
        setRole(roleByCode);
      }
    };

    getRole().catch((error) => console.error(error));
  });

  const filters: Filter[] = [{ code: 'owner:missing', operator: Operator.EQUALS, value: 'true' }];
  const roleCode = role?.specialty?.[0].coding?.[0] ?? role?.code?.[0].coding?.[0];

  if (!roleCode) {
    return <Document>Could not find this role</Document>;
  }

  if (roleCode?.code) {
    filters.push({ code: 'performer', operator: Operator.EQUALS, value: roleCode.code });
  }

  const search: SearchRequest = {
    resourceType: 'Task',
    fields: ['code', '_lastUpdated', 'owner', 'for', 'priority'],
    sortRules: [{ code: '-priority-order,due-date' }],
    filters,
  };

  return (
    <Document>
      <SearchControl
        search={search}
        onClick={(e) => navigate(`/${getReferenceString(e.resource)}`)}
        hideFilters={true}
        hideToolbar={true}
      />
    </Document>
  );
}

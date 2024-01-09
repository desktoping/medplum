import { AppShell, ErrorBoundary, Loading, Logo, NavbarLink, useMedplum, useMedplumProfile } from '@medplum/react';
import { IconDatabaseImport, IconFileImport, IconGridDots, IconUser } from '@tabler/icons-react';
import { Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Timeline } from './components/Timeline';
import { ResourceDetailsPage } from './pages/ResourceDetailsPage';
import { LandingPage } from './pages/LandingPage';
import { ResourcePage } from './pages/ResourcePage';
import { SearchPage } from './pages/SearchPage';
import { SignInPage } from './pages/SignInPage';
import { TaskPage } from './pages/TaskPage';
import { Practitioner, PractitionerRole } from '@medplum/fhirtypes';
import {
  Filter,
  formatSearchQuery,
  getDisplayString,
  getReferenceString,
  Operator,
  ResourceArray,
  SearchRequest,
} from '@medplum/core';
import { UploadDataPage } from './pages/UploadDataPage';

export function App(): JSX.Element | null {
  const medplum = useMedplum();
  const location = useLocation();
  const profile = useMedplumProfile() as Practitioner;
  const [roles, setRoles] = useState<PractitionerRole[]>();

  const [userLinks, setUserLinks] = useState<NavbarLink[]>([
    { icon: <IconGridDots />, label: 'All Tasks', href: '/Task' },
  ]);

  // Fetch the practitioner roles assigned to the current user
  useEffect(() => {
    const getUserPractitionerRoles = async (): Promise<void> => {
      if (profile) {
        const results: ResourceArray<PractitionerRole> = await medplum.searchResources('PractitionerRole', {
          practitioner: `Practitioner/${profile.id}`,
        });

        const practitionerRoles: PractitionerRole[] = results.filter(
          (result) => result.resourceType === 'PractitionerRole'
        );

        setRoles(practitionerRoles);
      }
    };

    // Create a link to the tasks assigned to the current user
    const getMyTasksLink = async (): Promise<void> => {
      if (!profile) {
        return;
      }

      const userReference = getReferenceString(profile);
      const updatedLinks = [...userLinks];

      const myTasksSearch: SearchRequest = {
        resourceType: 'Task',
        fields: ['code', '_lastUpdated', 'owner', 'for', 'priority'],
        sortRules: [{ code: '-priority-order,due-date' }],
        filters: [
          { code: 'owner', operator: Operator.EQUALS, value: userReference },
          { code: 'status:not', operator: Operator.EQUALS, value: 'completed' },
        ],
      };

      const myTasksQuery = formatSearchQuery(myTasksSearch);
      const newLink = { icon: <IconUser />, label: 'My Tasks', href: `/Task${myTasksQuery}` };
      const label = newLink.label;

      for (const link of updatedLinks) {
        if (link.label === label) {
          return;
        }
      }
      updatedLinks.push(newLink);

      setUserLinks(updatedLinks);
    };

    const fetchRoles = async (): Promise<void> => {
      await getUserPractitionerRoles();
      await getMyTasksLink();
    };

    fetchRoles().catch((error) => console.error(error));
  }, [profile]);

  // Update links on the sidebar to include links to queues assigned to the current user's role. For more details, see https://www.medplum.com/docs/careplans/tasks#task-assignment
  useEffect(() => {
    const getLinks = (): void => {
      const updatedLinks = [...userLinks];

      if (roles) {
        for (const role of roles) {
          const roleCode = role?.specialty?.[0].coding?.[0] ?? role?.code?.[0].coding?.[0];

          const filters: Filter[] = [{ code: 'owner:missing', operator: Operator.EQUALS, value: 'true' }];

          if (roleCode?.code) {
            filters.push({ code: 'performer', operator: Operator.EQUALS, value: roleCode.code });
          }

          const search: SearchRequest = {
            resourceType: 'Task',
            fields: ['code', '_lastUpdated', 'owner', 'for', 'priority'],
            sortRules: [{ code: '-priority-order,due-date' }],
            filters,
          };

          const searchQuery = formatSearchQuery(search);
          const roleDisplay = getPractitionerRoleDisplay(role);
          const newLink = { icon: <IconUser />, label: `${roleDisplay} Tasks`, href: `/Task${searchQuery}` };

          for (const link of updatedLinks) {
            if (link.label === newLink.label) {
              return;
            }
          }

          updatedLinks.push(newLink);
        }
      }

      setUserLinks(updatedLinks);
    };

    getLinks();
  }, [roles]);

  if (medplum.isLoading()) {
    return null;
  }

  return (
    <AppShell
      logo={<Logo size={24} />}
      menus={[
        {
          title: 'My Links',
          links: userLinks,
        },
        {
          title: 'Upload Data',
          links: [
            { icon: <IconDatabaseImport />, label: 'Upload Core Data', href: '/upload/core' },
            { icon: <IconFileImport />, label: 'Upload Example Data', href: '/upload/example' },
          ],
        },
      ]}
      resourceTypeSearchDisabled={true}
      headerSearchDisabled={true}
    >
      <ErrorBoundary key={location.key}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={profile ? <SearchPage /> : <LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/:resourceType" element={<SearchPage />} />
            <Route path="/:resourceType/:id" element={<ResourcePage />} />
            <Route path="/:resourceType/:id/_history/:versionId" element={<ResourcePage />} />
            <Route path="/Task/:id" element={<TaskPage />}>
              <Route index element={<TaskPage />} />
              <Route path="details" element={<ResourceDetailsPage />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="notes" element={<TaskPage />} />
            </Route>
            <Route path="/Task" element={<SearchPage />} />
            <Route path="/upload/:dataType" element={<UploadDataPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}

function getPractitionerRoleDisplay(practitionerRole: PractitionerRole): string {
  let display;
  if (practitionerRole.specialty?.[0].coding?.[0].display) {
    display = practitionerRole.specialty[0].coding?.[0].display;
  } else if (practitionerRole.code?.[0].coding?.[0].display) {
    display = practitionerRole.code[0].coding?.[0].display;
  } else {
    display = getDisplayString(practitionerRole);
  }

  return display;
}

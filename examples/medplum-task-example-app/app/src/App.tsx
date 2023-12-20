import { AppShell, ErrorBoundary, Loading, Logo, NavbarLink, useMedplum, useMedplumProfile } from '@medplum/react';
import { IconGridDots, IconLayoutList, IconListCheck, IconUser } from '@tabler/icons-react';
import { Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Timeline } from './components/Timeline';
import { AllTasks } from './pages/AllTasks';
import { ResourceDetailsPage } from './pages/ResourceDetailsPage';
import { LandingPage } from './pages/LandingPage';
import { ResourcePage } from './pages/ResourcePage';
import { SearchPage } from './pages/SearchPage';
import { SignInPage } from './pages/SignInPage';
import { TaskByRoleQueue } from './pages/TaskByRoleQueue';
import { TaskPage } from './pages/TaskPage';
import { MyTasks } from './pages/MyTasks';
import { PractitionerRole } from '@medplum/fhirtypes';
import { getDisplayString, ResourceArray } from '@medplum/core';

export function App(): JSX.Element | null {
  const medplum = useMedplum();
  const location = useLocation();
  const profile = useMedplumProfile();
  const [roles, setRoles] = useState<PractitionerRole[]>();
  const [userLinks, setUserLinks] = useState<NavbarLink[]>([
    { icon: <IconLayoutList />, label: 'My Tasks', href: '/Task/mytasks' },
    { icon: <IconListCheck />, label: 'Tasks For My Role', href: '/Task/queue' },
    { icon: <IconGridDots />, label: 'All Tasks', href: '/Task' },
  ]);

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

    const fetchRoles = async () => {
      await getUserPractitionerRoles();
    };

    fetchRoles();
  }, [profile]);

  useEffect(() => {
    const getLinks = (): void => {
      const updatedLinks = [...userLinks];

      if (roles) {
        for (const role of roles) {
          const roleDisplay = getPractitionerRoleDisplay(role);
          updatedLinks.push({ icon: <IconUser />, label: `${roleDisplay} Tasks`, href: `/Task/queue/${roleDisplay}` });
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
      ]}
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
            <Route path="/Task" element={<AllTasks />} />
            <Route path="/Task/mytasks" element={<MyTasks />} />
            <Route path="/Task/queue" element={<TaskByRoleQueue />} />
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

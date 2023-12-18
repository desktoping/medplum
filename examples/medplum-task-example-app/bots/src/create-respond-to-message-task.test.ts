import { getReferenceString, indexSearchParameterBundle, indexStructureDefinitionBundle } from '@medplum/core';
import { readJson } from '@medplum/definitions';
import { Bundle, Communication, SearchParameter } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { assignToPractitionerBatch, assignToQueueBatch, threadsWithTasks } from './communication-data';
import { handler } from './create-respond-to-message-task';

describe('Create Respond to Message Task', async () => {
  beforeAll(() => {
    indexStructureDefinitionBundle(readJson('fhir/r4/profiles-types.json') as Bundle);
    indexStructureDefinitionBundle(readJson('fhir/r4/profiles-resources.json') as Bundle);
    indexSearchParameterBundle(readJson('fhir/r4/search-parameters.json') as Bundle<SearchParameter>);
    indexSearchParameterBundle(readJson('fhir/r4/search-parameters-medplum.json') as Bundle<SearchParameter>);
  });

  test('No messages in the last 30 minutes', async () => {
    const medplum = new MockClient();
    console.log = vi.fn();

    const sender = await medplum.createResource({
      resourceType: 'Patient',
      name: [
        {
          family: 'Smith',
          given: ['John'],
        },
      ],
    });

    const threadHeader: Communication = await medplum.createResource({
      resourceType: 'Communication',
      sent: new Date().toISOString(),
      status: 'in-progress',
    });

    await medplum.createResource({
      resourceType: 'Communication',
      sent: new Date().toISOString(),
      partOf: [
        {
          reference: getReferenceString(threadHeader),
        },
      ],
      sender: {
        reference: getReferenceString(sender),
      },
    });

    const result = await handler(medplum);
    expect(result).toBe(false);
    expect(console.log).toBeCalledWith('No messages in the last 30 minutes that require a response.');
  });

  test('Messages in the last 30 minutes not sent by patients', async () => {
    const medplum = new MockClient();
    console.log = vi.fn();

    const now = new Date();
    const earlier = new Date(now.getTime() - 15 * 60 * 1000);

    const sender = await medplum.createResource({
      resourceType: 'Practitioner',
      name: [
        {
          family: 'Smith',
          given: ['John'],
        },
      ],
    });

    const threadHeader: Communication = await medplum.createResource({
      resourceType: 'Communication',
      sent: earlier.toISOString(),
      status: 'in-progress',
    });

    await medplum.createResource({
      resourceType: 'Communication',
      sent: earlier.toISOString(),
      partOf: [
        {
          reference: getReferenceString(threadHeader),
        },
      ],
      sender: {
        reference: getReferenceString(sender),
      },
    });

    const result = await handler(medplum);
    expect(result).toBe(false);
    expect(console.log).toBeCalledWith('No messages in the last 30 minutes that require a response.');
  });

  test('Messages part of thread that already has active task', async () => {
    const medplum = new MockClient();
    console.log = vi.fn();

    await medplum.executeBatch(threadsWithTasks);

    const result = await handler(medplum);
    expect(result).toBe(true);
    expect(console.log).toBeCalledWith('Task already exists for this thread.');
  });

  test('Assign task to care coordinator queue', async () => {
    const medplum = new MockClient();
    console.log = vi.fn();

    await medplum.executeBatch(assignToQueueBatch);

    const result = await handler(medplum);
    expect(result).toBe(true);
    expect(console.log).toBeCalledWith('Task created');
    expect(console.log).toBeCalledWith('Assigned to care coordinator queue');
  });

  test('Assign to practitioner who previously responded to thread', async () => {
    const medplum = new MockClient();
    console.log = vi.fn();

    await medplum.executeBatch(assignToPractitionerBatch);

    const result = await handler(medplum);
    expect(result).toBe(true);
    expect(console.log).toBeCalledWith('Task created');
    expect(console.log).toBeCalledWith('Assigned to most recent responder');
  });
});

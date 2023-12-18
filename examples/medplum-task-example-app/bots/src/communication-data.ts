import { Bundle } from '@medplum/fhirtypes';

export const assignToQueueBatch: Bundle = {
  resourceType: 'Bundle',
  type: 'batch',
  entry: [
    {
      fullUrl: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        subject: {
          reference: 'Patient/8f0d3209-0ee0-487f-b186-4328a949190f',
          display: 'Mr. Lucien408 Bosco882 PharmD',
        },
        topic: {
          coding: [
            {
              code: 'Lab test results',
              display: 'Lab test results',
            },
          ],
        },
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      fullUrl: 'urn:uuid:f9e25a08-9db5-11ee-8c90-0242ac120002',
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        topic: {
          coding: [
            {
              code: 'Schedule a Physical',
              display: 'Schedule a Physical',
            },
          ],
        },
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        payload: [
          {
            contentString: 'Do you have the results of my lab tests yet?',
          },
        ],
        topic: {
          text: 'December 15th lab tests.',
        },
        partOf: [
          {
            reference: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
          },
        ],
        sender: {
          reference: 'Patient/8f0d3209-0ee0-487f-b186-4328a949190f',
        },
        sent: '2023-12-18T14:26:06.531Z',
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        payload: [
          {
            contentString: 'Can I schedule a physical for December 23rd?',
          },
        ],
        topic: {
          text: 'Schedule a Physical',
        },
        partOf: [
          {
            reference: 'urn:uuid:f9e25a08-9db5-11ee-8c90-0242ac120002',
          },
        ],
        sender: {
          reference: 'Patient/8f0d3209-0ee0-487f-b186-4328a949190f',
        },
        sent: '2023-12-18T14:01:15.175Z',
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
  ],
};

export const assignToPractitionerBatch: Bundle = {
  resourceType: 'Bundle',
  type: 'batch',
  entry: [
    {
      fullUrl: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        subject: {
          reference: 'Patient/8f0d3209-0ee0-487f-b186-4328a949190f',
          display: 'Mr. Lucien408 Bosco882 PharmD',
        },
        topic: {
          coding: [
            {
              code: 'Lab test results',
              display: 'Lab test results',
            },
          ],
        },
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        payload: [
          {
            contentString: 'Do you have the results of my lab tests yet?',
          },
        ],
        topic: {
          text: 'December 15th lab tests.',
        },
        partOf: [
          {
            reference: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
          },
        ],
        sender: {
          reference: 'Patient/8f0d3209-0ee0-487f-b186-4328a949190f',
        },
        sent: '2023-12-18T14:26:06.531Z',
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        payload: [
          {
            contentString: 'Do you have the test id number?',
          },
        ],
        topic: {
          text: 'December 15th lab tests.',
        },
        partOf: [
          {
            reference: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
          },
        ],
        sender: {
          reference: 'Practitioner/b95651dc-448b-42c3-b427-f26d082a574d',
        },
        sent: '2023-12-18T14:28:06.531Z',
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        payload: [
          {
            contentString: 'Yes, it is 12345',
          },
        ],
        topic: {
          text: 'December 15th lab tests.',
        },
        partOf: [
          {
            reference: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
          },
        ],
        sender: {
          reference: 'Patient/8f0d3209-0ee0-487f-b186-4328a949190f',
        },
        sent: '2023-12-18T14:46:06.531Z',
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
  ],
};

export const threadsWithTasks: Bundle = {
  resourceType: 'Bundle',
  type: 'batch',
  entry: [
    {
      fullUrl: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        subject: {
          reference: 'Patient/8f0d3209-0ee0-487f-b186-4328a949190f',
          display: 'Mr. Lucien408 Bosco882 PharmD',
        },
        topic: {
          coding: [
            {
              code: 'Lab test results',
              display: 'Lab test results',
            },
          ],
        },
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        payload: [
          {
            contentString: 'Do you have the results of my lab tests yet?',
          },
        ],
        topic: {
          text: 'December 15th lab tests.',
        },
        partOf: [
          {
            reference: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
          },
        ],
        sender: {
          reference: 'Patient/8f0d3209-0ee0-487f-b186-4328a949190f',
        },
        sent: '2023-12-18T14:26:06.531Z',
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        payload: [
          {
            contentString: 'Do you have the test id number?',
          },
        ],
        topic: {
          text: 'December 15th lab tests.',
        },
        partOf: [
          {
            reference: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
          },
        ],
        sender: {
          reference: 'Practitioner/b95651dc-448b-42c3-b427-f26d082a574d',
        },
        sent: '2023-12-18T14:28:06.531Z',
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      resource: {
        resourceType: 'Communication',
        status: 'in-progress',
        payload: [
          {
            contentString: 'Yes, it is 12345',
          },
        ],
        topic: {
          text: 'December 15th lab tests.',
        },
        partOf: [
          {
            reference: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
          },
        ],
        sender: {
          reference: 'Patient/8f0d3209-0ee0-487f-b186-4328a949190f',
        },
        sent: '2023-12-18T14:46:06.531Z',
      },
      request: {
        method: 'POST',
        url: 'Communication',
      },
    },
    {
      resource: {
        resourceType: 'Task',
        status: 'in-progress',
        focus: {
          reference: 'urn:uuid:d9d3cba2-9db5-11ee-8c90-0242ac120002',
        },
        code: {
          text: 'Respond to Message',
        },
      },
      request: {
        method: 'POST',
        url: 'Task',
      },
    },
  ],
};

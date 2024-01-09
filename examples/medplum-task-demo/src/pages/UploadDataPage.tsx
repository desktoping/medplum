import { Button } from '@mantine/core';
import { Document } from '@medplum/react';
import { useNavigate, useParams } from 'react-router-dom';

export function UploadDataPage(): JSX.Element {
  // const medplum = useMedplum();
  const { dataType } = useParams();
  const navigate = useNavigate();

  const dataTypeDisplay = dataType ? dataType?.charAt(0).toUpperCase() + dataType?.slice(1) : '';

  function handleUpload(): void {
    // await medplum.executeBatch(data);
    navigate('/');
  }

  return (
    <Document>
      <Button onClick={handleUpload}>{`Upload ${dataTypeDisplay} Data`}</Button>
    </Document>
  );
}

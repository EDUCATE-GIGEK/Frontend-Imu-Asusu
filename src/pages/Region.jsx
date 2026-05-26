import { useParams } from 'react-router-dom';

export default function Region() {
  const { continentId, countryId, regionId } = useParams();
  return (
    <h1>
      Region: {regionId}{' '}
      <small>
        ({countryId}, {continentId})
      </small>
    </h1>
  );
}

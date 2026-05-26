import { useParams } from 'react-router-dom';

export default function Country() {
  const { continentId, countryId } = useParams();
  return (
    <h1>
      Country: {countryId} <small>({continentId})</small>
    </h1>
  );
}

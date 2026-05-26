import { useParams } from 'react-router-dom';

export default function Continent() {
  const { continentId } = useParams();
  return <h1>Continent: {continentId}</h1>;
}

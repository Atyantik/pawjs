import { useParams } from 'react-router';
import { toName } from '../../utils/text';

const NestedRoute2 = () => {
  const { name } = useParams();
  return (
    <h2>
      Hi, <span className="is-capitalized">{toName(name || '')}!</span>
    </h2>
  );
};

export default NestedRoute2;

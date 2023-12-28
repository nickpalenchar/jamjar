import { FC } from 'react';
import { useParams } from 'react-router-dom';

export const Jam: FC = () => {
  let { jamId } = useParams();
  return <div>This is the Jam component! {jamId} ) !</div>;
};

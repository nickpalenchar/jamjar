import { useNavigate } from 'react-router-dom';
// import useUser from "../auth/identity";
// import Loading from "../components/Loading";
import { MobilishView } from '../components/MobilishView';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import { FC } from 'react';

export const SelectAJam: FC<{}> = () => {
  const navigate = useNavigate();
  // const user = useUser();
  // if (user === null) {
  //   return <Loading/>
  // }
  const user = {};
  return (
    <MobilishView>
      <br />
      <br />
      <h1>Find a Jam</h1>
      <hr />
      <br />
      <InputGroup>
        <InputGroup.Text>2-word phrase:</InputGroup.Text>
        <FormControl placeholder='(e.g. "shining pearl")' />
        <Button variant="outline-primary">Find</Button>
      </InputGroup>
      {/*<input type="text"*/}
      {/*       className='input-center'*/}
      {/*       placeholder='two words (e.g. "shining-pearl")'/> | <button>Enter</button>*/}
      <br />
      <div
        style={{
          display: 'flex',
          alignContent: 'center',
          flexDirection: 'column',
        }}
      ></div>
    </MobilishView>
  );
};

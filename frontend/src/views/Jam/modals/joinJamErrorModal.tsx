import React, { FC } from 'react';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';

/** Render this component to automatically prompt the user to join*/
export const JoinJamErrorModal: FC<{
  onJoin: CallableFunction;
  opened?: boolean;
}> = ({ opened }) => {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: opened ?? false });
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Jive to this Jam</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <WarningTwoIcon color="red.600" /> <b>Error - </b> unable to join
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Bummer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

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

/** Render this component to automatically prompt the user to join*/
export const JoinJamModal: FC<{ onJoin: CallableFunction }> = ({ onJoin }) => {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Jive to this Jam</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Join below to submit songs and vote on others.</ModalBody>

          <ModalFooter>
            <Button
              colorScheme="green"
              mr={3}
              onClick={async () => {
                await onJoin();
                onClose();
              }}
            >
              im in.
            </Button>
            <Button onClick={onClose} colorScheme="gray">
              Nah fam
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

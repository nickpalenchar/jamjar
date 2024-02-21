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

interface ErrorModalProps {
  isOpen: any;
  onClose: any;

  opened?: boolean;

  header?: string;
  body: string;
  buttonText?: string;
}

/** Render this component to automatically prompt the user to join*/
export const ErrorModal: FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  opened = false,
  header,
  body,
  buttonText = 'Bummer',
}) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {header && <ModalHeader>{header}</ModalHeader>}
          <ModalCloseButton />
          <ModalBody>
            <WarningTwoIcon color="red.600" /> {body}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>{buttonText}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

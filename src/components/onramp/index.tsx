import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'

type OnrampModalProps = {
  address?: string
  isOpen: boolean
  onClose: () => void
}

export const OnrampModal = (props: OnrampModalProps) => {
  const { isOpen, onClose } = props
  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered scrollBehavior='inside'>
      <ModalOverlay className='bg-ic-black bg-opacity-60 backdrop-blur' />
      <ModalContent className='border-ic-gray-100 bg-ic-white mx-0 my-0 rounded-xl border-2 p-0'>
        <ModalHeader>Buy</ModalHeader>
        <ModalCloseButton />
        <ModalBody className='m-0 p-0'>
          <iframe
            src='https://buy.onramper.com?apiKey=pk_prod_01HREVCX1YJDHAHQ6BE777J41B'
            title='Onramper Widget'
            height='600px'
            width='100%'
            // allow='accelerometer; autoplay; camera; gyroscope; payment'
          ></iframe>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

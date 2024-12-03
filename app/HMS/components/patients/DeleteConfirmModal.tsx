'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  patientName: string
  isLoading: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  isLoading
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader>确认删除</ModalHeader>
        <ModalBody>
          <p>确定要删除患者 &ldquo;{patientName}&rdquo; 的记录吗？此操作不可撤销。</p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={onClose}
            isDisabled={isLoading}
          >
            取消
          </Button>
          <Button
            color="danger"
            onPress={onConfirm}
            isLoading={isLoading}
          >
            删除
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 
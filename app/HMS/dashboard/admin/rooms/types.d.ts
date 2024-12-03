import { Room } from '../../../types'

interface AddRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface EditRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  room: Room | null
}

declare module './AddRoom' {
  const AddRoom: React.FC<AddRoomModalProps>
  export default AddRoom
}

declare module './EditRoom' {
  const EditRoom: React.FC<EditRoomModalProps>
  export default EditRoom
} 
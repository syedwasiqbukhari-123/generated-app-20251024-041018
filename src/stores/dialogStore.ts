import { create } from 'zustand';
import { Patient, Appointment, Invoice, Service, User } from '@shared/types';
export type DialogType = 
  | 'newPatient' 
  | 'newAppointment' 
  | 'newInvoice' 
  | 'userProfile' 
  | 'settings';
interface DialogState {
  dialogType: DialogType | null;
  isOpen: boolean;
  openDialog: (dialogType: DialogType) => void;
  closeDialog: () => void;
}
export const useDialogStore = create<DialogState>((set) => ({
  dialogType: null,
  isOpen: false,
  openDialog: (dialogType) => set({ isOpen: true, dialogType }),
  closeDialog: () => set({ isOpen: false, dialogType: null }),
}));
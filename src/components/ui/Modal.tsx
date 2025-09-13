"use client";
import { Dialog, DialogBackdrop, DialogPanel, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export function Modal({ open, title, children }: {
  open: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={() => {}} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <DialogPanel className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-xl p-6 shadow-xl">
              {title && <Dialog.Title className="text-lg font-semibold mb-2">{title}</Dialog.Title>}
              {children}
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

"use client";

import { FC } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose }) => {

    const { authenticated, login, logout } = usePrivy();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col gap-2 items-center justify-center bg-black/50">
            <div className="bg-[#242424] text-foreground rounded-lg shadow-lg w-[90%] max-w-md p-7 relative">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-semibold">Get GIN Tokens</h2>
                    <button onClick={onClose} className="text-foreground">
                        <X className="h-5 w-5 text-foreground" />
                    </button>
                </div>
                {/* Modal Body */}
                <p className="text-sm text-muted-foreground mb-6">
                    Purchase tokens to unlock AI agent interactions
                </p>
                <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex gap-1"
                    onClick={authenticated ? logout : login}
                >
                    <Image src="/images/connect.svg" alt="connect" width={22} height={16} />
                  
                    {authenticated ? "Disconnect MetaMask" : "Connect MetaMask"}
                </Button>
         
            </div>

            <div className="bg-[#242424] text-foreground rounded-lg shadow-lg w-[90%] max-w-md p-7 relative">

                <div>
                    <h3 className="text-2xl font-semibold mb-4">Add tokens</h3>
                    <div className="flex gap-2 mb-4">
                        <div className="w-1/3 bg-[#2E2E2E] text-foreground p-2 rounded-md text-center">
                            500K
                        </div>
                        <div className="w-1/3 bg-[#2E2E2E] text-foreground p-2 rounded-md text-center">
                            1M
                        </div>
                        <div className="w-1/3 bg-[#2E2E2E] text-foreground p-2 rounded-md text-center">
                            2M
                        </div>
                    </div>
                    <label className="text-muted-foreground">Manual amount</label>
                    <input
                        type="number"
                        placeholder="Manual amount"
                        className="w-full px-4 py-3 rounded-md bg-[#2E2E2E] text-foreground placeholder-gray-500 my-3 focus:outline-none"
                    />
                    <div className="flex gap-2 mt-4">
                        <Button className="w-full bg-[#FFFFFF] text-primary-foreground">
                            Add tokens
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full bg-[#242424] text-white border-[#414141] rounded-md"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

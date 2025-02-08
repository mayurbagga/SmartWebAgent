"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Modal } from "@/components/Modal";
import { usePrivy } from "@privy-io/react-auth";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [disconnectModalOpen, setDisconnectModalOpen] =
    useState<boolean>(false);
  const { authenticated, login, logout, user } = usePrivy();

  const walletAddress = user?.wallet?.address;
  const truncatedAddress =
    walletAddress &&
    `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const navigateToCreatePage = () => {
    router.push("/create");
  };

  const handleDisconnectClick = () => {
    setDisconnectModalOpen(true); // Open the disconnect confirmation modal
  };

  const confirmDisconnect = () => {
    logout();
    setDisconnectModalOpen(false); // Close the modal after logout
  };

  const cancelDisconnect = () => {
    setDisconnectModalOpen(false); // Close the modal without logging out
  };

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {pathname === "/" ? (
            // Show logo only on the homepage
            <Image
              src="/images/logo.svg"
              alt="Gintonic"
              width={107}
              height={35}
            />
          ) : (
            // Show back arrow and text on other pages
            <div className="flex items-center gap-4">
              <Link href="/" className="text-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold">Back</h1>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Dropdown icon shown only on mobile */}
          <div
            className="md:hidden flex items-center gap-2 cursor-pointer bg-[#212121] p-3 rounded-full"
            onClick={toggleModal}
          >
            <Image
              src="/images/dropdown.svg"
              alt="dropdown"
              width={10}
              height={18}
            />
          </div>

          {/* Balance and Create Agent button */}
          <div
            className="hidden md:flex items-center gap-2 cursor-pointer"
            onClick={toggleModal}
          >
            <div className="p-1 rounded-full bg-primary">
              <Plus className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-white">0.00 GIN</span>
          </div>

          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={navigateToCreatePage}
          >
            {/* Text changes based on screen size */}
            <span className="hidden md:inline">Build Your Agent</span>
            <span className="md:hidden">Build Agent</span>
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex gap-1"
            onClick={authenticated ? handleDisconnectClick : login} // Show confirmation modal for disconnect
          >
            <Image
              src="/images/connect.svg"
              alt="connect"
              width={22}
              height={16}
            />
            <span className="hidden md:inline">
              {authenticated ? truncatedAddress || "Connected" : "Connect"}
            </span>
            <span className="md:hidden">
              {authenticated
                ? truncatedAddress?.slice(0, 3) || "Connected"
                : ""}
            </span>
          </Button>
        </div>
      </header>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={toggleModal} />

      {/* Disconnect Confirmation Modal */}
      {disconnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1F1F1F] rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold mb-4">Disconnect Wallet</h2>
            <p className="text-sm mb-6">
              Are you sure you want to disconnect your wallet?
            </p>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-primary text-primary-foreground rounded-md"
                onClick={confirmDisconnect}
              >
                Disconnect
              </Button>
              <button
                className="bg-[#242424] text-white border-[#414141] rounded-md px-4 py-2"
                onClick={cancelDisconnect}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

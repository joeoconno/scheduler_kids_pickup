"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CreateRewardForm } from "@/components/rewards/create-reward-form";

export function AddRewardButton({ scope }: { scope: "PERSONAL" | "SHARED" }) {
  return (
    <Modal
      trigger={
        <Button size="sm" variant={scope === "PERSONAL" ? "primary" : "secondary"}>
          + New reward
        </Button>
      }
      title={scope === "PERSONAL" ? "New personal reward" : "New shared reward"}
    >
      {(close) => <CreateRewardForm scope={scope} onDone={close} />}
    </Modal>
  );
}

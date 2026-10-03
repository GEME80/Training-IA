"use client";

import React from "react";
import { AthleteBreBPaymentModal, AthleteBreBPaymentModalProps } from "./AthleteBreBPaymentModal";

export type AthleteNequiPaymentModalProps = AthleteBreBPaymentModalProps;

/**
 * Backward compatibility alias: redirects to AthleteBreBPaymentModal
 * supporting Bre-B (Banco de la República) and BBVA Colombia interoperable payments.
 */
export const AthleteNequiPaymentModal: React.FC<AthleteNequiPaymentModalProps> = (props) => {
  return <AthleteBreBPaymentModal {...props} />;
};

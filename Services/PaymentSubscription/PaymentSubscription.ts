import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Subscription {
  expiredDate: string;
  subscriptionDate: string;
  paymentAmount: number;
  userId: number;
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

interface signal {
  signal: AbortSignal;
  id:number
}

export const GetPaymentSubsciption = async ({
  signal,
  id
}: signal): Promise<{
  Subscriptions: Subscription[];
}> => {
  try {
    const response = await httpClient.get({
      url: `${apiLinks.Subscription.GET}/${id}`,
      signal: signal,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching Payment subscription"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const Subscription = response.data;
    return {
      Subscriptions: Subscription.result as Subscription[],
    };
  } catch (error) {
    console.error("Fetching SkillSet failed", error);
    throw error;
  }
};

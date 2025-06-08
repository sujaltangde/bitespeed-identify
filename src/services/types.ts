export type Contact = {
  email?: string;
  phoneNumber?: string;
  linkedId?: number | null;
  linkPrecedence: "primary" | "secondary";
};

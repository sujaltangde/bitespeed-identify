export type Contact = {
  email?: string;
  phoneNumber?: string;
  linkedId?: number | null;
  linkPrecedence: "primary" | "secondary";
};

export type ContactSchemaType = {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: "primary" | "secondary";
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};


export type LinkPrecedence = "primary" | "secondary";

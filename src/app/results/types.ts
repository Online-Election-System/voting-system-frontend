export type ElectionYear = "2024" | "2020" | "2016";

export type Candidate = {
  id: string;
  name: string;
  party: string;
  electoralVotes: number;
  popularVotes: number;
  image: string;
  color: string;
};

export type District = {
  name: string;
  code: string;
  electoralVotes: number;
  winner: string;
  margin: number;
};

export type UpdateType = "update" | "called" | "projection";

export type Update = {
  id: number;
  time: string;
  district: string;
  message: string;
  type: UpdateType;
};

export type ElectionData = {
  [year in ElectionYear]: {
    candidates: Candidate[];
    totalVotes: number;
    districts: District[];
    updates: Update[];
  };
};

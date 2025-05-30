// components/candidate-card.tsx
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Candidate {
  id: number; // ✅ changed from string to number
  name: string;
  party: string;
  bio: string;
  image: string;
}

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <Card className="overflow-hidden bg-white">
      <div className="aspect-square relative">
        <Image
          src={candidate.image || "/placeholder.svg"}
          alt={candidate.name}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{candidate.name}</CardTitle>
        <Badge variant="outline">{candidate.party}</Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <CardDescription>{candidate.bio}</CardDescription>
      </CardContent>
    </Card>
  );
}

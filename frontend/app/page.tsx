import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Vote, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 relative overflow-hidden bg-gradient-to-b from-background to-background/80">
      {/* Nigerian flag design elements */}
      <div className="absolute top-0 left-0 w-full h-8 bg-[#008751]" />
      <div className="absolute top-8 left-0 w-full h-8 bg-white" />
      <div className="absolute top-16 left-0 w-full h-8 bg-[#008751]" />

      {/* Flag corner decoration */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center space-x-2 ">
        <div className="w-8 h-16 md:w-12 md:h-24 flex flex-col">
          <div className="flex-1 bg-[#008751]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#008751]" />
        </div>
        <span className="text-sm md:text-base font-semibold">Nigeria</span>
      </div>

      {/* Decorative circles */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#008751]/10" />
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#008751]/10" />
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mt-16">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              INEC Blockchain Voting System
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Secure, transparent, and tamper-proof electoral polling powered by
              blockchain technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
              <Shield className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-bold">Secure Authentication</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Authenticate securely with your National Identification Number
                (NIN)
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
              <Vote className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-bold">Blockchain Voting</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Cast your vote securely with blockchain technology ensuring
                tamper-proof results
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border p-6 rounded-lg">
              <CheckCircle className="h-12 w-12 text-primary" />
              <h2 className="text-xl font-bold">Transparent Results</h2>
              <p className="text-gray-500 dark:text-gray-400">
                View voting history and results with complete transparency
              </p>
            </div>
          </div>
          <div className="space-x-4 mt-8">
            <Button asChild size="lg">
              <Link href="/register">Register Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

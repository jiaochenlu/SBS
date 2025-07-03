import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Homepage() {
  return (
    <div className="flex flex-col items-center bg-gradient-to-b from-white to-blue-50 min-h-screen p-8">
      {/* Header Carousel */}
      <div className="w-full max-w-4xl mt-8">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-center">
          <div className="flex-1 flex justify-center">
            <img
              src="/copilot-vs-gemini.png"
              alt="Copilot vs Gemini"
              className="w-48 h-48 object-contain"
            />
          </div>
          <div className="flex-1 mt-4 md:mt-0 md:ml-6">
            <span className="text-purple-600 font-semibold text-sm">New</span>
            <h2 className="text-2xl font-bold mt-2">Chat Arena experience</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Chat Arena public preview with modern UX experience and voting & sharing capabilities.
            </p>
            <div className="mt-4 space-x-2">
              <Button variant="outline">Learn more</Button>
              <Button>Try it now</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="text-center mt-16">
        <h1 className="text-3xl font-bold">
          Smarter Comparisons, Faster Competition, Sharper Insights
        </h1>
        <p className="text-gray-600 mt-2">
          Discover the power of collaboration with our Copilot Side-By-Side, ready to work alongside you.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl">
        <Card className="text-center p-4">
          <CardContent>
            <div className="h-40 bg-gray-100 rounded mb-4"></div>
            <h3 className="font-semibold">Competitive study</h3>
            <p className="text-sm text-gray-600 mt-2">
              Benchmark against competitors with structured, multi-dimensional comparisons powered by SBS.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-4">
          <CardContent>
            <div className="h-40 bg-gray-100 rounded mb-4"></div>
            <h3 className="font-semibold">Quality Gaps Analysis</h3>
            <p className="text-sm text-gray-600 mt-2">
              Capture diverse feedback signals to uncover quality trends and refine product experience.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center p-4">
          <CardContent>
            <div className="h-40 bg-gray-100 rounded mb-4"></div>
            <h3 className="font-semibold">Human-in-loop Evaluation</h3>
            <p className="text-sm text-gray-600 mt-2">
              Integrate human judgment into new feature evaluation for more accurate, controllable outcomes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ✅ Key features implemented:
// - Full responsive layout
// - Carousel styled header card (static image placeholder for now)
// - Section title with subtitle
// - Three structured cards matching your prototype semantics
// Let me know if you want Tailwind breakpoints adjustments, API integration points, or next page routes scaffolding in your next iteration today.

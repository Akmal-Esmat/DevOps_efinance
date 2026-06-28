"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-100">
      <div className="flex flex-col items-center text-center px-6">

        {/* Robot */}
        <div className="mb-10">
          <Image
            src="/images/robot.png"
            alt="Robot"
            width={300}
            height={300}
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-slate-900">
          Welcome!
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-xl text-lg text-gray-600">
          Your AI assistant is here to help you answer questions,
          solve problems, and get things done.
        </p>

        {/* Button */}
        <Link href="/chat">
        <button
          className="
            mt-12
            rounded-2xl
            bg-gradient-to-r
            from-blue-600
            to-violet-600
            px-12
            py-5
            text-xl
            font-semibold
            text-white
            shadow-xl
            transition
            hover:scale-105
            hover:shadow-2xl
          "
        >
          Start Chatting →
        </button>
        </Link>
      </div>
    </main>
  );
}
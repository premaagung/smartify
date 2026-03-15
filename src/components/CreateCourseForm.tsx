"use client";
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { z } from "zod";
import { createChaptersSchema } from "@/validators/course";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Plus, Trash, Loader2, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import SubscriptionAction from "./SubscriptionAction";
import { cn } from "@/lib/utils";

type Props = { isPro: boolean };
type Input = z.infer<typeof createChaptersSchema>;

const CreateCourseForm = ({ isPro }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: createChapters, isPending } = useMutation({
    mutationFn: async ({ title, units }: Input) => {
      const response = await axios.post("/api/course/createChapters", {
        title,
        units,
      });
      return response.data;
    },
  });

  const form = useForm<Input>({
    resolver: zodResolver(createChaptersSchema),
    defaultValues: {
      title: "",
      units: ["", "", ""],
    },
  });

  function onSubmit(data: Input) {
    if (data.units.some((unit) => unit === "")) {
      toast({
        title: "Error",
        description: "Please fill all the units before generating.",
        variant: "destructive",
      });
      return;
    }
    createChapters(data, {
      onSuccess: ({ course_id }) => {
        toast({
          title: "Course created!",
          description: "Your course has been generated successfully.",
        });
        router.push(`/create/${course_id}`);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      },
    });
  }

  form.watch();
  const units = form.watch("units");

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Course Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  Course Title
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Introduction to Machine Learning"
                    {...field}
                    disabled={isPending}
                    className="mt-1.5 bg-[#020B18] border-slate-700 text-white placeholder:text-slate-600 focus:border-emerald-500/60 focus:ring-emerald-500/20 rounded-lg h-11 text-sm transition-colors"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Units */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Course Units
              </h3>
              <span className="text-xs text-slate-600">
                {units.length} unit{units.length !== 1 ? "s" : ""}
              </span>
            </div>

            <AnimatePresence>
              {units.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <FormField
                    control={form.control}
                    name={`units.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {index + 1}
                          </span>
                          Unit {index + 1}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`e.g. ${
                              index === 0
                                ? "Fundamentals and Core Concepts"
                                : index === 1
                                ? "Practical Applications"
                                : "Advanced Techniques"
                            }`}
                            {...field}
                            disabled={isPending}
                            className="mt-1 bg-[#020B18] border-slate-700 text-white placeholder:text-slate-600 focus:border-emerald-500/60 focus:ring-emerald-500/20 rounded-lg h-10 text-sm transition-colors"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add / Remove unit buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => form.setValue("units", [...units, ""])}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 text-xs font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Unit
              </button>
              <button
                type="button"
                onClick={() => form.setValue("units", units.slice(0, -1))}
                disabled={isPending || units.length <= 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 text-xs font-medium transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash className="w-3.5 h-3.5" />
                Remove Last
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800" />

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-150",
              isPending
                ? "bg-emerald-600/50 text-white/60 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Course...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Course
              </>
            )}
          </button>
        </form>
      </Form>

      {!isPro && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <SubscriptionAction />
        </div>
      )}
    </div>
  );
};

export default CreateCourseForm;
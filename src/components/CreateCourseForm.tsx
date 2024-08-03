"use client";
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { z } from "zod";
import { createChaptersSchema } from "@/validators/course";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Plus, Trash, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import SubscriptionAction from "./SubscriptionAction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
        description: "Please fill all the units",
        variant: "destructive",
      });
      return;
    }
    createChapters(data, {
      onSuccess: ({ course_id }) => {
        toast({
          title: "Success",
          description: "Course created successfully",
        });
        router.push(`/create/${course_id}`);
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      },
    });
  }

  form.watch();

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          <BookOpen className="inline-block mr-2 mb-1" />
          Create New Course
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Course Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the main topic of the course"
                      {...field}
                      disabled={isPending}
                      className="text-lg"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Course Units</h3>
              <AnimatePresence>
                {form.watch("units").map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FormField
                      control={form.control}
                      name={`units.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-md">Unit {index + 1}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter subtopic of the course"
                              {...field}
                              disabled={isPending}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("units", [...form.watch("units"), ""])}
                disabled={isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("units", form.watch("units").slice(0, -1))}
                disabled={isPending || form.watch("units").length <= 1}
              >
                <Trash className="w-4 h-4 mr-2" />
                Remove Unit
              </Button>
            </div>

            <Separator />

            <Button
              disabled={isPending}
              type="submit"
              className="w-full"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Course...
                </>
              ) : (
                'Create Course'
              )}
            </Button>
          </form>
        </Form>
        {!isPro && (
          <div className="mt-6">
            <SubscriptionAction />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateCourseForm;
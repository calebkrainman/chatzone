"use client";

import { postMessage } from "@/lib/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Socket } from "socket.io-client";
import { toast } from "sonner";
import z from "zod";
import { Form, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export function MessageInput({
  channelId,
  socket,
}: {
  channelId: string;
  socket: Socket;
}) {
  const formSchema = z.object({
    message: z
      .string()
      .min(1, `Message cannot be empty`)
      .max(56, `Message must be at most 56 characters`)
      .trim(),
  });

  type schemaType = z.infer<typeof formSchema>;

  const form = useForm<schemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  /*
   * Handles form submission to post a new message
   * Takes formData as an argument, which contains the message to be posted
   * Uses the postMessage function to send the message to the backend
   * If the message is posted successfully, it resets the form, emits a 'chat message' event via the socket, and shows a success toast
   * If there is an error during the posting process, it catches the error and shows an error toast with the appropriate message
   * The function is asynchronous and uses try-catch for error handling
   * @param formData - The data from the form containing the message to be posted
   * @returns void
   * @throws Will throw an error if the message posting fails
   */
  async function onSubmit(formData: schemaType) {
    try {
      const res = await postMessage({
        content: formData.message,
        channelId: channelId,
      });
      form.reset();
      socket.emit("chat message", res.newMessage);
      toast.success(`Message Posted! ${res.newMessage.content}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(`An unknown error has occured`);
      }
    }
  }

  return (
    <div className="p-4 bg-white/20 backdrop-blur-xl border-t border-white/30">
      <div className="flex gap-3">
        <div className="flex-1 relative ">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex w-full items-center gap-2">
                      <Input
                        {...field}
                        placeholder="Type a message..."
                        autoComplete="off"
                        className="bg-white/30 backdrop-blur-sm border-white/40 rounded-2xl px-auto text-gray-800 placeholder:text-gray-600"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

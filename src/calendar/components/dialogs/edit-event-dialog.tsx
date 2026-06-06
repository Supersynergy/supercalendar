"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO } from "date-fns";
import { AlertTriangle } from "lucide-react";
import type { TimeValue } from "react-aria-components";
import { useForm } from "react-hook-form";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useUpdateEvent } from "@/calendar/hooks/use-update-event";
import type { IEvent } from "@/calendar/interfaces";
import type { TEventFormData } from "@/calendar/schemas";
import { eventSchema } from "@/calendar/schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SingleDayPicker } from "@/components/ui/single-day-picker";
import { Textarea } from "@/components/ui/textarea";
import { TimeInput } from "@/components/ui/time-input";
import { useDisclosure } from "@/hooks/use-disclosure";

interface IProps {
  children?: React.ReactNode;
  event: IEvent;
  // Optional controlled open state — lets parents (e.g. the details dialog's
  // keyboard shortcut) open Edit without rendering a trigger.
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditEventDialog({ children, event, open: openProp, onOpenChange }: IProps) {
  const disclosure = useDisclosure();

  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : disclosure.isOpen;
  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else if (next) disclosure.onOpen();
    else disclosure.onClose();
  };
  const onClose = () => setOpen(false);

  const { users, use24HourFormat, t } = useCalendar();

  const { updateEvent } = useUpdateEvent();

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      user: event.user.id,
      title: event.title,
      description: event.description,
      startDate: parseISO(event.startDate),
      startTime: { hour: parseISO(event.startDate).getHours(), minute: parseISO(event.startDate).getMinutes() },
      endDate: parseISO(event.endDate),
      endTime: { hour: parseISO(event.endDate).getHours(), minute: parseISO(event.endDate).getMinutes() },
      color: event.color,
    },
  });

  const onSubmit = (values: TEventFormData) => {
    const user = users.find(user => user.id === values.user);

    if (!user) throw new Error("User not found");

    const startDateTime = new Date(values.startDate);
    startDateTime.setHours(values.startTime.hour, values.startTime.minute);

    const endDateTime = new Date(values.endDate);
    endDateTime.setHours(values.endTime.hour, values.endTime.minute);

    updateEvent({
      ...event,
      user,
      title: values.title,
      color: values.color,
      description: values.description,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.editEvent")}</DialogTitle>
          <DialogDescription>
            <AlertTriangle className="mr-1 inline-block size-4 text-yellow-500" />
            This form only updates the current event state locally for demonstration purposes. If you move an event after editing, some inconsistencies may
            occur. In a real application, you should submit this form to a backend API to persist the changes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="user"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("event.responsible")}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-invalid={fieldState.invalid}>
                        <SelectValue placeholder={t("dialog.selectOption")} />
                      </SelectTrigger>

                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id} className="flex-1">
                            <div className="flex items-center gap-2">
                              <Avatar key={user.id} className="size-6">
                                <AvatarImage src={user.picturePath ?? undefined} alt={user.name} />
                                <AvatarFallback className="text-xxs">{user.name[0]}</AvatarFallback>
                              </Avatar>

                              <p className="truncate">{user.name}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="title">{t("dialog.title")}</FormLabel>

                  <FormControl>
                    <Input id="title" placeholder={t("dialog.enterTitle")} data-invalid={fieldState.invalid} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel htmlFor="startDate">{t("event.startDate")}</FormLabel>

                    <FormControl>
                      <SingleDayPicker
                        id="startDate"
                        value={field.value}
                        onSelect={date => field.onChange(date as Date)}
                        placeholder="Select a date"
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("dialog.startTime")}</FormLabel>

                    <FormControl>
                      <TimeInput
                        value={field.value as TimeValue}
                        onChange={field.onChange}
                        hourCycle={use24HourFormat ? 24 : 12}
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("event.endDate")}</FormLabel>
                    <FormControl>
                      <SingleDayPicker
                        value={field.value}
                        onSelect={date => field.onChange(date as Date)}
                        placeholder="Select a date"
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("dialog.endTime")}</FormLabel>
                    <FormControl>
                      <TimeInput
                        value={field.value as TimeValue}
                        onChange={field.onChange}
                        hourCycle={use24HourFormat ? 24 : 12}
                        data-invalid={fieldState.invalid}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("dialog.color")}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-invalid={fieldState.invalid}>
                        <SelectValue placeholder={t("dialog.selectOption")} />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="blue">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-blue-600" />
                            Blue
                          </div>
                        </SelectItem>

                        <SelectItem value="green">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-green-600" />
                            Green
                          </div>
                        </SelectItem>

                        <SelectItem value="red">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-red-600" />
                            Red
                          </div>
                        </SelectItem>

                        <SelectItem value="yellow">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-yellow-600" />
                            Yellow
                          </div>
                        </SelectItem>

                        <SelectItem value="purple">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-purple-600" />
                            Purple
                          </div>
                        </SelectItem>

                        <SelectItem value="orange">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-orange-600" />
                            Orange
                          </div>
                        </SelectItem>

                        <SelectItem value="gray">
                          <div className="flex items-center gap-2">
                            <div className="size-3.5 rounded-full bg-neutral-600" />
                            Gray
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("event.description")}</FormLabel>

                  <FormControl>
                    <Textarea {...field} value={field.value} data-invalid={fieldState.invalid} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("dialog.cancel")}
            </Button>
          </DialogClose>

          <Button form="event-form" type="submit">
            {t("dialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

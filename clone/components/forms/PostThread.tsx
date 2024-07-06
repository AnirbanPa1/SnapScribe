"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { Image as IconImage, XCircle as CloseImage } from 'lucide-react';
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";
import { ChangeEvent, useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { getCaptions, getSuggestion } from "@/lib/actions/ai_suggestion.actions";

interface Props {
  userId: string;
}

function PostThread({ userId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const { startUpload } = useUploadThing("media");

  const [cap, setCap] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const { organization } = useOrganization();

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedImage = event.target.files![0];
    setImage(selectedImage);

    // Upload the image as soon as it's selected
    if (selectedImage) {
      const imgRes = await startUpload([selectedImage]);
      if (imgRes && imgRes[0].url) {
        const { hasgtags } = await getSuggestion({
          image: imgRes[0].url
        })

        setHash(hasgtags);

        console.log(hasgtags)


        // If upload is successful, update the form value with the image URL
        form.setValue("imageUrl", imgRes[0].url);

      }
    }
  };

  const handleDeselect = () => {
    setImage(null);
    form.setValue("imageUrl", null); // Reset the imageUrl field value
  };

  const form = useForm<z.infer<typeof ThreadValidation>>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
      imageUrl: null,
    },
  });



  const [text, setText] = useState('');

  const handleChange = (event: any) => {
    setText(event.target.value);
  };

  const handleButtonClick = async () => {
    const { captions } = await getCaptions({ text });

    setCap(captions);
  };


  const handleHashCopy = () => {
    if (hash) {
      const hashCopy = hash
      navigator.clipboard.writeText(hashCopy)
      alert("Hashtags Successfully Copied.")
    }
  }

  const handleCapCopy = () => {
    if (cap) {
      const capCopy = cap
      navigator.clipboard.writeText(capCopy)
      alert("Caption Successfully Copied.")
    }
  }


  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    // Create the thread
    await createThread({
      text: values.thread,
      author: userId,
      communityId: organization ? organization.id : null,
      path: pathname,
      imageUrl: values.imageUrl,
    });

    // Redirect to the appropriate page
    router.push("/");
  };

  return (
    <Form {...form}>
      <form
        className='mt-10 flex flex-col justify-start gap-10'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='thread'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-dark-2'>
                Content
              </FormLabel>
              <input
                type="file"
                accept="image/*"
                style={{
                  display: 'none',
                }}
                ref={fileRef}
                onChange={handleImageChange}
              />
              <FormControl className='object-cover relative rounded-md no-focus bg-slate-300 text-dark-1'>
                <div className="object-contain justify-end items-end">
                  {image == null ? (
                    <Button variant='ghost' type="button" className="absolute z-10 right-0 m-3 bottom-0 bg-teal-500 hover:bg-teal-700" onClick={() => {
                      fileRef.current?.click();
                    }}>
                      <IconImage />
                    </Button>
                  ) : (
                    <div className="absolute right-0 bottom-0 z-10 m-3 rounded-md shadow-lg shadow-dark-3">
                      <div className="absolute justify-0 right-0 bottom-0 m-3 rounded-md">
                        <Button
                          variant='ghost'
                          type="button"
                          onClick={handleDeselect}
                        >
                          <CloseImage />
                        </Button>
                      </div>
                      <Image
                        src={URL.createObjectURL(image)}
                        alt="image"
                        height={300}
                        width={300}
                        className="rounded-md"
                      />
                    </div>
                  )}
                  <Textarea
                    rows={23}
                    {...field}
                    className="account-form_input" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='bg-teal-500 hover:bg-teal-700'>
          Post
        </Button>

        <div>
          {hash && (<div className="hover:bg-slate-300 rounded-md p-2 cursor-copy" onClick={handleHashCopy}>
            <p className='text-base-semibold text-dark-2'>Here are some suggested hashtags based on your chosen photo...</p>
            <p>{hash}</p>
          </div>)}
        </div>

        <div className="flex flex-col justify-start gap-4">
          <p className='font-bold text-dark-2'>Can't figure out what to write?</p>
          <p className='text-base-semibold text-light-4'>Describe your idea and we will generate a thread for you...</p>

          <textarea value={text} onChange={handleChange} rows={3} className="account-form_input rounded-md p-2" placeholder="Describe Here..." />

          <Button onClick={handleButtonClick} type="button" className='bg-teal-500 hover:bg-teal-700'>Generate</Button>
        </div>


        {cap && (<div className="hover:bg-slate-300 rounded-md p-2 cursor-copy" onClick={handleCapCopy}>
          <p>{cap}</p>
        </div>)}

      </form>
    </Form>
  );
}

export default PostThread;

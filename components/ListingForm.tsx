import { useState } from 'react';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { Formik, Form } from 'formik';
import Input from '@/components/Input';
import ImageUpload from '@/components/ImageUpload';
import axios, { AxiosResponse } from 'axios';
import { Home } from '@prisma/client';


const ListingSchema = Yup.object().shape({
  title: Yup.string().trim().required(),
  description: Yup.string().trim().required(),
  price: Yup.number().positive().integer().min(1).required(),
  guests: Yup.number().positive().integer().min(1).required(),
  beds: Yup.number().positive().integer().min(1).required(),
  baths: Yup.number().positive().integer().min(1).required(),
});

// type ListFormFormType = Omit<Home, "image">

type ListFormType = {
  title: string,
  description: string,
  price: number,
  guests:number, 
  beds: number,
  baths: number,
}


type ListingFormProps = {
  redirectPath: string,
  buttonText: string,
  onSubmit: (data: any) => Promise<AxiosResponse<any, any>>
}


const ListingForm = ({
  redirectPath = '',
  buttonText = 'Submit',
  onSubmit,
}: ListingFormProps) => {
  const router = useRouter();


  const [imageUrl, setImageUrl] = useState('');

const [initialFormValues, setInitialFormValues] = useState<ListFormType>({
  title: '',
  description: '',
  price: 0,
  guests: 1,
  beds: 1,
  baths: 1,
});

const [disabled, setDisabled] = useState(false);


  const upload: (image: string | ArrayBuffer | null) => Promise<void> = async (image) => {
    if (!image) return;
    let toastId;
    try {
      setDisabled(true);
      toastId = toast.loading('Uploading...');
      const { data } = await axios.post('/api/image-upload', { image });
      // Why is image not updated
      console.log("data",data)
      console.log("data.url",data.url)
      setImageUrl(data.url);
      toast.success('Successfully uploaded', { id: toastId });
    } catch (e) {
      toast.error('Unable to upload', { id: toastId });
      setImageUrl('');
    } finally {
      setDisabled(false);
    }
  };

  const handleOnSubmit = async (values: any) => {
    let toastId;
    try {
      setDisabled(true);
      toastId = toast.loading('Submitting...');
      // Submit data
      if (typeof onSubmit === 'function') {
        await onSubmit({ ...values, image: imageUrl });
      }
      toast.success('Successfully submitted', { id: toastId });
      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (e) {
      console.log(e)
      toast.error('Unable to submit', { id: toastId });
      setDisabled(false);
    }
  };

  return (
    <div>
      <div className="mb-8 max-w-md">
        <ImageUpload
          key={imageUrl}
          initialImage={{ src: imageUrl, alt: "" }}
          onChangePicture={upload}
        />
      </div>

      <Formik
        initialValues={initialFormValues}
        validationSchema={ListingSchema}
        validateOnBlur={false}
        onSubmit={handleOnSubmit}
      >
        {({ isSubmitting, isValid }) => (
          <Form className="space-y-8">
            <div className="space-y-6">
              <Input
                name="title"
                type="text"
                label="Title"
                placeholder="Entire rental unit - Amsterdam"
                disabled={disabled}
              />

              <Input
                name="description"
                type="textarea"
                label="Description"
                placeholder="Very charming and modern apartment in Amsterdam..."
                disabled={disabled}
                rows={5}
              />

              <Input
                name="price"
                type="number"
                min="0"
                label="Price per night"
                placeholder="100"
                disabled={disabled}
              />

              <div className="flex space-x-4">
                <Input
                  name="guests"
                  type="number"
                  min="0"
                  label="Guests"
                  placeholder="2"
                  disabled={disabled}
                />
                <Input
                  name="beds"
                  type="number"
                  min="0"
                  label="Beds"
                  placeholder="1"
                  disabled={disabled}
                />
                <Input
                  name="baths"
                  type="number"
                  min="0"
                  label="Baths"
                  placeholder="1"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={disabled || !isValid}
                className="bg-rose-600 text-white py-2 px-6 rounded-md focus:outline-none focus:ring-4 focus:ring-rose-600 focus:ring-opacity-50 hover:bg-rose-500 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-600"
              >
                {isSubmitting ? 'Submitting...' : buttonText}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};


export default ListingForm;

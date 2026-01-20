import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/utils/trpc";

const nameSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(100, "名前は100文字以内で入力してください"),
});

type NameFormData = z.infer<typeof nameSchema>;

interface EditNameDialogProps {
  currentName: string;
  onClose: () => void;
}

export default function EditNameDialog({ currentName, onClose }: EditNameDialogProps) {
  const utils = trpc.useUtils();

  const updateName = trpc.user.updateName.useMutation({
    onSuccess: () => {
      alert("名前を更新しました");
      utils.user.getCurrentUser.invalidate();
      onClose();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: currentName,
    },
  });

  const onSubmit = (data: NameFormData) => {
    updateName.mutate(data);
  };

  return (
    <div>
      <div>
        <h2>名前を変更</h2>
        <p>
          表示される名前を変更できます。
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="name">名前</label>
            <input
              id="name"
              {...register("name")}
              placeholder="名前を入力"
            />
            {errors.name && <p>{errors.name.message}</p>}
          </div>
          <div>
            <button
              type="button"
              onClick={onClose}
              disabled={updateName.isPending}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={updateName.isPending}
            >
              {updateName.isPending ? "更新中..." : "更新"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

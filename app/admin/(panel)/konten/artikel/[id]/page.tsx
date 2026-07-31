import { ArticleEditorPage } from "@/components/admin/ArticlePages";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <ArticleEditorPage id={id}/>}

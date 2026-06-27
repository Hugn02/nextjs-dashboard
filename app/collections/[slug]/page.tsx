import CollectionsPage from "@/src/features/products/pages/CollectionPage";
import Footer from "@/src/layout/Footer";
import Navbar from "@/src/layout/Navbar";

export default async function Page({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    // Lỗi: `params` là một Promise. Chúng ta cần `await` để lấy giá trị của nó.
    // Đổi tên prop thành `paramsPromise` để rõ ràng hơn và sau đó `await` nó.
    const { slug } = await paramsPromise;

    return (
        <>
            <Navbar />
            <CollectionsPage slug={slug} />
            <Footer />
        </>
    );
}

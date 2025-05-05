// src/components/products/ProductBasicInfo.tsx
import { formatToRupiah } from "@/utils/priceFormated";
import { ProductRequest } from "@/utils/types/ProductType";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { Controller, UseFormSetValue } from "react-hook-form";


interface ProductBasicInfoProps {
    control: any;
    errors: any;
    submitting: boolean;
    displayPrice: string;
    setDisplayPrice: (price: string) => void;
    setValue: UseFormSetValue<ProductRequest>;
    categories: {
        id: string;
        name: string;
    }[];
}

const ProductBasicInfo = ({
    control,
    errors,
    submitting,
    displayPrice,
    setDisplayPrice,
    setValue,
    categories,
}: ProductBasicInfoProps) => {
    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = parseFromRupiah(event.target.value);
        setValue('price', numericValue);
        setDisplayPrice(formatToRupiah(numericValue));
    };

    const parseFromRupiah = (formattedValue: string): number => {
        const numericString = formattedValue.replace(/[^\d]/g, '');
        return numericString ? parseFloat(numericString) : 0;
    };

    return (
        <>
            {/* Product Name */}
            <Controller
                name="name"
                control={control}
                rules={{
                    required: "Name is required",
                    maxLength: {
                        value: 255,
                        message: "Name cannot exceed 255 characters",
                    },
                }}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Product Name"
                        variant="outlined"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={submitting}
                    />
                )}
            />

            {/* Description */}
            <Controller
                name="description"
                control={control}
                rules={{
                    required: "Description is required",
                }}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        disabled={submitting}
                    />
                )}
            />

            {/* Price */}
            <Controller
                name="price"
                control={control}
                rules={{
                    required: "Price is required",
                    min: { value: 0, message: "Price cannot be negative" },
                }}
                render={({ field: { value, ...restField } }) => (
                    <TextField
                        {...restField}
                        value={displayPrice || formatToRupiah(value)}
                        onChange={handlePriceChange}
                        label="Price"
                        variant="outlined"
                        fullWidth
                        error={!!errors.price}
                        helperText={errors.price?.message}
                        disabled={submitting}
                        inputProps={{ inputMode: 'numeric' }}
                    />
                )}
            />

            {/* Stock */}
            <Controller
                name="stock"
                control={control}
                rules={{
                    required: "Stock is required",
                    min: { value: 0, message: "Stock cannot be negative" },
                }}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Stock"
                        variant="outlined"
                        type="number"
                        fullWidth
                        error={!!errors.stock}
                        helperText={errors.stock?.message}
                        disabled={submitting}
                    />
                )}
            />

            {/* Category Select */}
            <Controller
                name="category_id"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category_id} disabled={submitting}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            {...field}
                            labelId="category-label"
                            label="Category"
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errors.category_id?.message}</FormHelperText>
                    </FormControl>
                )}
            />
        </>
    );
};

export default ProductBasicInfo;
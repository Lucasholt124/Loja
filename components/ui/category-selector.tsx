"use client";

import { Category } from "@/sanity.types";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Popover, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Check, ChevronsUpDown,  } from "lucide-react";
import { PopoverContent } from "@radix-ui/react-popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  categories: Category[];
}

const CategorySelectorComponent = ({ categories }: CategorySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="relative flex w-full max-w-full items-center justify-center space-x-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 hover:text-white sm:flex-none sm:justify-start"
        >
          {value
            ? categories.find((category) => category._id === value)?.title
            : "Filtrar por categoria"}
          <ChevronsUpDown className="ml-2 size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-10 w-full">
        <Command>
          <CommandInput
            placeholder={`Pesquisar categoria...`}
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const selectedCategory = categories.find((c) =>
                  c.title
                    ?.toLowerCase()
                    .includes(e.currentTarget.value.toLowerCase())
                );
                if (selectedCategory?.slug?.current) {
                  setValue(selectedCategory._id);
                  router.push(`/categories/${selectedCategory.slug.current}`);
                  setOpen(false);
                }
              }
            }}
          />
          <CommandList>
            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
          </CommandList>
          <CommandGroup>
            {categories.map((category) => (
              <CommandItem
                key={category._id}
                value={category.title}
                onSelect={() => {
                  setValue(value === category._id ? "" : category._id);
                  router.push(`/categories/${category.slug?.current}`);
                  setOpen(false);
                }}
              >
                {category.title}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === category._id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategorySelectorComponent;

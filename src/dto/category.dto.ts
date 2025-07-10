import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
	@ApiProperty({
		description: '分类标题',
		example: '人工智能',
		required: true
	})
	title: string;
}

export class UpdateCategoryDto {
	@ApiProperty({
		description: '分类标题',
		example: '机器学习',
		required: false
	})
	title?: string;
}
